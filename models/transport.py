from models.base_model import BaseModel
from models.empreinte_carbone import EmpreinteCarbone
from config import NAMESPACE, TRANSPORT_PRICING
import uuid

class Transport(BaseModel):
    def __init__(self, uri=None, nom=None, type_=None, emission_co2_per_km=None, a_empreinte=None, **kwargs):
        super().__init__(uri=uri, **kwargs)
        self.nom = nom
        self.type = type_
        self.emission_co2_per_km = emission_co2_per_km
        self.a_empreinte = a_empreinte
    
    def calculate_price(self, distance_km):
        """
        Calculate realistic transport price based on:
        - Base price (fixed cost per trip)
        - Distance-based cost (€/km)
        - Carbon tax (based on CO2 emissions)
        
        Args:
            distance_km (float): Distance in kilometers
        
        Returns:
            dict: Detailed price breakdown
        """
        if not self.type or distance_km <= 0:
            return {
                'total': 0.0,
                'base_price': 0.0,
                'distance_cost': 0.0,
                'carbon_tax': 0.0,
                'distance_km': distance_km
            }
        
        # Get pricing components
        base_price = TRANSPORT_PRICING['base_prices'].get(self.type, 2.0)
        price_per_km = TRANSPORT_PRICING['price_per_km'].get(self.type, 0.15)
        carbon_tax_rate = TRANSPORT_PRICING['carbon_tax_per_kg']
        
        # Calculate components
        distance_cost = price_per_km * distance_km
        
        # Carbon tax: convert g/km to kg for the total distance
        co2_kg = (self.emission_co2_per_km / 1000.0) * distance_km if self.emission_co2_per_km else 0
        carbon_tax = co2_kg * carbon_tax_rate
        
        total = base_price + distance_cost + carbon_tax
        
        return {
            'total': round(total, 2),
            'base_price': round(base_price, 2),
            'distance_cost': round(distance_cost, 2),
            'carbon_tax': round(carbon_tax, 2),
            'distance_km': distance_km,
            'co2_kg': round(co2_kg, 4)
        }
    
    def get_price_per_km(self):
        """Get the base price per km without carbon tax"""
        return TRANSPORT_PRICING['price_per_km'].get(self.type, 0.15)
    
    def to_sparql_insert(self):
        """Generate SPARQL triples for Transport and its EmpreinteCarbone"""
        triples = f"<{self.uri}> a <{NAMESPACE}Transport> .\n"
        
        if self.nom:
            # Escape quotes and backslashes in strings
            safe_nom = self.nom.replace('\\', '\\\\').replace('"', '\\"')
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{safe_nom}"^^xsd:string .\n'
        
        if self.type:
            # Escape quotes and backslashes in strings
            safe_type = self.type.replace('\\', '\\\\').replace('"', '\\"')
            triples += f'<{self.uri}> <{NAMESPACE}type> "{safe_type}"^^xsd:string .\n'
        
        if self.emission_co2_per_km is not None:
            triples += f'<{self.uri}> <{NAMESPACE}emissionCO2PerKm> "{self.emission_co2_per_km}"^^xsd:decimal .\n'
            
            # Automatically create EmpreinteCarbone if not provided
            if not self.a_empreinte:
                # Generate unique URI for the empreinte
                empreinte_id = str(uuid.uuid4())
                self.a_empreinte = f"{NAMESPACE}Empreinte_{empreinte_id}"
            
            # Calculate total CO2 value in kg (assuming 1 km as base)
            # emissionCO2PerKm is in g/km, convert to kg
            valeur_co2_kg = float(self.emission_co2_per_km) / 1000.0
            
            # Create EmpreinteCarbone instance and get its triples
            empreinte = EmpreinteCarbone(uri=self.a_empreinte, valeur_co2_kg=valeur_co2_kg)
            triples += empreinte.to_sparql_insert() + "\n"
            
            # Link Transport to EmpreinteCarbone
            triples += f'<{self.uri}> <{NAMESPACE}aEmpreinte> <{self.a_empreinte}> .\n'
        
        return triples.rstrip('\n')
