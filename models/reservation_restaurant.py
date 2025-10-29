from models.base_model import BaseModel
from config import NAMESPACE
from datetime import datetime

class ReservationRestaurant(BaseModel):
    """
    Model for restaurant table reservations made by tourists.
    Includes conflict prevention for double-bookings.
    """
    def __init__(self, uri=None, touriste=None, restaurant=None, 
                 date_reservation=None, heure=None, nombre_personnes=None,
                 statut="en_attente", notes_speciales=None, 
                 telephone=None, email=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.touriste = touriste                    # URI du touriste
        self.restaurant = restaurant                # URI du restaurant
        self.date_reservation = date_reservation    # Date de la réservation (YYYY-MM-DD)
        self.heure = heure                         # Heure (ex: "19:00")
        self.nombre_personnes = nombre_personnes   # Nombre de personnes
        self.statut = statut                       # en_attente, confirmee, annulee
        self.notes_speciales = notes_speciales     # Allergies, régimes spéciaux, etc.
        self.telephone = telephone
        self.email = email
        self.date_creation = kwargs.get('date_creation', datetime.now().isoformat())
    
    def to_sparql_insert(self):
        """Generate SPARQL INSERT query for the reservation"""
        triples = f"<{self.uri}> a <{NAMESPACE}ReservationRestaurant> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        
        if self.touriste:
            triples += f'<{self.uri}> <{NAMESPACE}reservePar> <{self.touriste}> .\n'
        if self.restaurant:
            triples += f'<{self.uri}> <{NAMESPACE}reservePour> <{self.restaurant}> .\n'
        if self.date_reservation:
            triples += f'<{self.uri}> <{NAMESPACE}dateReservation> "{self.date_reservation}"^^xsd:date .\n'
        if self.heure:
            triples += f'<{self.uri}> <{NAMESPACE}heureReservation> "{self.heure}"^^xsd:string .\n'
        if self.nombre_personnes:
            triples += f'<{self.uri}> <{NAMESPACE}nombrePersonnes> {self.nombre_personnes} .\n'
        if self.statut:
            triples += f'<{self.uri}> <{NAMESPACE}statut> "{self.statut}"^^xsd:string .\n'
        if self.notes_speciales:
            escaped_notes = self.notes_speciales.replace('"', '\\"').replace('\n', '\\n')
            triples += f'<{self.uri}> <{NAMESPACE}notesSpeciales> "{escaped_notes}"^^xsd:string .\n'
        if self.telephone:
            triples += f'<{self.uri}> <{NAMESPACE}telephone> "{self.telephone}"^^xsd:string .\n'
        if self.email:
            triples += f'<{self.uri}> <{NAMESPACE}email> "{self.email}"^^xsd:string .\n'
        if self.date_creation:
            triples += f'<{self.uri}> <{NAMESPACE}dateCreation> "{self.date_creation}"^^xsd:dateTime .\n'
        
        return triples
    
    @staticmethod
    def check_availability(manager, restaurant_uri, date_reservation, heure):
        """
        Check if a time slot is available at a restaurant.
        Returns True if available, False if there's a conflict.
        """
        query = f"""
            PREFIX ns: <{NAMESPACE}>
            ASK {{
                ?reservation a ns:ReservationRestaurant .
                ?reservation ns:reservePour <{restaurant_uri}> .
                ?reservation ns:dateReservation "{date_reservation}"^^xsd:date .
                ?reservation ns:heureReservation "{heure}"^^xsd:string .
                ?reservation ns:statut ?statut .
                FILTER(?statut != "annulee")
            }}
        """
        result = manager.execute_ask(query)
        return not result  # Returns True if no conflict (available)
    
    @staticmethod
    def check_tourist_conflict(manager, touriste_uri, date_reservation, heure):
        """
        Check if a tourist already has a reservation at the same date and time.
        Returns True if tourist is available, False if there's a conflict.
        """
        query = f"""
            PREFIX ns: <{NAMESPACE}>
            ASK {{
                ?reservation a ns:ReservationRestaurant .
                ?reservation ns:reservePar <{touriste_uri}> .
                ?reservation ns:dateReservation "{date_reservation}"^^xsd:date .
                ?reservation ns:heureReservation "{heure}"^^xsd:string .
                ?reservation ns:statut ?statut .
                FILTER(?statut != "annulee")
            }}
        """
        result = manager.execute_ask(query)
        return not result  # Returns True if no conflict (tourist is available)
    
    @staticmethod
    def check_restaurant_capacity(manager, restaurant_uri, date_reservation, heure, nombre_personnes):
        """
        Check if restaurant has enough capacity for the requested number of guests.
        Returns (is_available: bool, current_capacity: int, max_capacity: int, message: str)
        """
        # First, get the restaurant's maximum capacity
        capacity_query = f"""
            PREFIX ns: <{NAMESPACE}>
            SELECT ?capaciteMax
            WHERE {{
                <{restaurant_uri}> ns:capaciteMax ?capaciteMax .
            }}
        """
        
        try:
            capacity_results = manager.execute_query(capacity_query)
            if not capacity_results or len(capacity_results) == 0:
                # No capacity limit set, allow reservation
                return (True, 0, None, "No capacity limit set")
            
            max_capacity = int(capacity_results[0].get('capaciteMax', 0))
            if max_capacity == 0:
                return (True, 0, 0, "No capacity limit set")
            
            # Get total number of people already reserved for this time slot
            reserved_query = f"""
                PREFIX ns: <{NAMESPACE}>
                SELECT (SUM(?nombrePersonnes) as ?total)
                WHERE {{
                    ?reservation a ns:ReservationRestaurant .
                    ?reservation ns:reservePour <{restaurant_uri}> .
                    ?reservation ns:dateReservation "{date_reservation}"^^xsd:date .
                    ?reservation ns:heureReservation "{heure}"^^xsd:string .
                    ?reservation ns:nombrePersonnes ?nombrePersonnes .
                    ?reservation ns:statut ?statut .
                    FILTER(?statut != "annulee")
                }}
            """
            
            reserved_results = manager.execute_query(reserved_query)
            current_reserved = 0
            if reserved_results and len(reserved_results) > 0:
                total_str = reserved_results[0].get('total', '0')
                if total_str:
                    current_reserved = int(total_str)
            
            # Check if there's enough space
            available_capacity = max_capacity - current_reserved
            
            if nombre_personnes <= available_capacity:
                return (True, current_reserved, max_capacity, f"Available space for {nombre_personnes} guests")
            else:
                return (False, current_reserved, max_capacity, 
                       f"Not enough capacity. {available_capacity} seats available, but {nombre_personnes} requested")
        
        except Exception as e:
            print(f"Error checking capacity: {e}")
            return (True, 0, None, "Could not verify capacity, allowing reservation")

