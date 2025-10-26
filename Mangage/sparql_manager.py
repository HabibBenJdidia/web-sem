from SPARQLWrapper import SPARQLWrapper, JSON, POST, BASIC
import requests
from config import FUSEKI_QUERY_ENDPOINT, FUSEKI_UPDATE_ENDPOINT, FUSEKI_USER, FUSEKI_PASSWORD, NAMESPACE

class SPARQLManager:
    def __init__(self):
        self.query_endpoint = SPARQLWrapper(FUSEKI_QUERY_ENDPOINT)
        
        self.query_endpoint.setHTTPAuth(BASIC)
        self.query_endpoint.setCredentials(FUSEKI_USER, FUSEKI_PASSWORD)
        self.query_endpoint.setReturnFormat(JSON)
    
    def execute_query(self, query):
        """Execute SPARQL SELECT query"""
        try:
            self.query_endpoint.setQuery(query)
            results = self.query_endpoint.query().convert()
            return results['results']['bindings']
        except Exception as e:
            return {"error": str(e)}
    
    def execute_update(self, query):
        """Execute SPARQL INSERT/DELETE/UPDATE query using requests directly"""
        try:
            response = requests.post(
                FUSEKI_UPDATE_ENDPOINT,
                data=query,
                headers={'Content-Type': 'application/sparql-update; charset=UTF-8'},
                auth=(FUSEKI_USER, FUSEKI_PASSWORD)
            )
            if response.status_code in [200, 201, 204]:
                return {"success": True}
            else:
                return {"error": f"Fuseki returned {response.status_code}: {response.text}"}
        except Exception as e:
            return {"error": str(e)}
    
    # CREATE
    def create(self, model_instance):
        """Insert a new entity"""
        triples = model_instance.to_sparql_insert()
        query = f"""PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT DATA {{
{triples}}}"""
        return self.execute_update(query)
    
    # READ
    def get_by_uri(self, uri):
        """Get entity by URI"""
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        
        SELECT ?p ?o
        WHERE {{
            <{uri}> ?p ?o .
        }}
        """
        return self.execute_query(query)
    
    def get_all(self, class_name):
        """Get all entities of a class"""
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        
        SELECT ?s ?p ?o
        WHERE {{
            ?s a <{NAMESPACE}{class_name}> .
            ?s ?p ?o .
        }}
        """
        return self.execute_query(query)
    
    def search(self, class_name=None, filters=None):
        """Search entities with filters"""
        where_clause = ""
        
        if class_name:
            where_clause += f"?s a <{NAMESPACE}{class_name}> .\n"
        else:
            where_clause += "?s a ?type .\n"
        
        if filters:
            for key, value in filters.items():
                if isinstance(value, str):
                    where_clause += f'?s <{NAMESPACE}{key}> "{value}" .\n'
                else:
                    where_clause += f'?s <{NAMESPACE}{key}> {value} .\n'
        
        where_clause += "?s ?p ?o ."
        
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        
        SELECT ?s ?p ?o
        WHERE {{
            {where_clause}
        }}
        """
        return self.execute_query(query)
    
    # UPDATE
    def update(self, uri, property_uri, old_value, new_value):
        """Update a property value"""
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        
        DELETE {{
            <{uri}> <{property_uri}> {old_value} .
        }}
        INSERT {{
            <{uri}> <{property_uri}> {new_value} .
        }}
        WHERE {{
            <{uri}> <{property_uri}> {old_value} .
        }}
        """
        return self.execute_update(query)
    
    def update_property(self, uri, property_name, new_value, is_string=True):
        """Update property with automatic formatting"""
        if is_string:
            value_str = f'"{new_value}"^^xsd:string'
        else:
            value_str = str(new_value)
        
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        DELETE {{
            <{uri}> <{NAMESPACE}{property_name}> ?old .
        }}
        INSERT {{
            <{uri}> <{NAMESPACE}{property_name}> {value_str} .
        }}
        WHERE {{
            <{uri}> <{NAMESPACE}{property_name}> ?old .
        }}
        """
        return self.execute_update(query)
    
    # DELETE
    def delete(self, uri):
        """Delete an entity and all its properties"""
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        
        DELETE WHERE {{
            <{uri}> ?p ?o .
        }}
        """
        return self.execute_update(query)
    
    def delete_property(self, uri, property_name):
        """Delete a specific property"""
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        
        DELETE WHERE {{
            <{uri}> <{NAMESPACE}{property_name}> ?o .
        }}
        """
        return self.execute_update(query)
    
    # ADVANCED SEARCH
    def search_by_name(self, name):
        """Search entities by name"""
        query = f"""
        PREFIX eco-tourism: <{NAMESPACE}>
        
        SELECT ?s ?type ?p ?o
        WHERE {{
            ?s <{NAMESPACE}nom> ?nom .
            ?s a ?type .
            ?s ?p ?o .
            FILTER(CONTAINS(LCASE(?nom), LCASE("{name}")))
        }}
        """
        return self.execute_query(query)
    
    def get_touristes_by_destination(self, destination_uri):
        """Get tourists in a destination"""
        query = f"""
        PREFIX eco-tourism: <{NAMESPACE}>
        
        SELECT ?touriste ?nom ?age
        WHERE {{
            ?touriste a <{NAMESPACE}Touriste> .
            ?touriste <{NAMESPACE}nom> ?nom .
            OPTIONAL {{ ?touriste <{NAMESPACE}age> ?age . }}
            ?touriste <{NAMESPACE}sejourneDans> ?hebergement .
            ?hebergement <{NAMESPACE}situeDans> <{destination_uri}> .
        }}
        """
        return self.execute_query(query)
    
    def get_eco_hebergements(self):
        """Get eco-friendly accommodations"""
        query = f"""
        PREFIX eco-tourism: <{NAMESPACE}>
        
        SELECT ?hebergement ?nom ?niveauEco ?energie
        WHERE {{
            ?hebergement a <{NAMESPACE}Hebergement> .
            ?hebergement <{NAMESPACE}nom> ?nom .
            OPTIONAL {{ ?hebergement <{NAMESPACE}niveauEco> ?niveauEco . }}
            OPTIONAL {{ ?hebergement <{NAMESPACE}utiliseEnergie> ?energie . }}
        }}
        """
        return self.execute_query(query)
    
    def get_activities_by_difficulty(self, difficulty):
        """Get activities by difficulty level"""
        query = f"""
        PREFIX eco-tourism: <{NAMESPACE}>
        
        SELECT ?activite ?nom ?duree ?prix
        WHERE {{
            ?activite a <{NAMESPACE}Activite> .
            ?activite <{NAMESPACE}nom> ?nom .
            ?activite <{NAMESPACE}difficulte> "{difficulty}"^^xsd:string .
            OPTIONAL {{ ?activite <{NAMESPACE}dureeHeures> ?duree . }}
            OPTIONAL {{ ?activite <{NAMESPACE}prix> ?prix . }}
        }}
        """
        return self.execute_query(query)
    
    def get_bio_products(self):
        """Get organic products"""
        query = f"""
        PREFIX eco-tourism: <{NAMESPACE}>
        
        SELECT ?produit ?nom ?saison
        WHERE {{
            ?produit a <{NAMESPACE}ProduitLocalBio> .
            ?produit <{NAMESPACE}nom> ?nom .
            ?produit <{NAMESPACE}bio> true .
            OPTIONAL {{ ?produit <{NAMESPACE}saison> ?saison . }}
        }}
        """
        return self.execute_query(query)
    
    def get_zero_emission_transport(self):
        """Get zero emission transport"""
        query = f"""
        PREFIX eco-tourism: <{NAMESPACE}>
        
        SELECT ?transport ?nom ?emission
        WHERE {{
            ?transport a <{NAMESPACE}Transport> .
            ?transport <{NAMESPACE}nom> ?nom .
            ?transport <{NAMESPACE}emissionCO2PerKm> ?emission .
            FILTER(?emission = 0.0)
        }}
        """
        return self.execute_query(query)
    
    def get_certified_entities(self, certification_uri):
        """Get entities with specific certification"""
        query = f"""
        PREFIX eco-tourism: <{NAMESPACE}>
        
        SELECT ?entity ?type ?nom
        WHERE {{
            ?entity <{NAMESPACE}aCertification> <{certification_uri}> .
            ?entity a ?type .
            OPTIONAL {{ ?entity <{NAMESPACE}nom> ?nom . }}
        }}
        """
        return self.execute_query(query)
    
    def get_events_by_date_range(self, start_date, end_date):
        """Get events in date range"""
        query = f"""
        PREFIX eco-tourism: <{NAMESPACE}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        SELECT ?event ?nom ?date ?prix
        WHERE {{
            ?event a <{NAMESPACE}Evenement> .
            ?event <{NAMESPACE}nom> ?nom .
            ?event <{NAMESPACE}eventDate> ?date .
            OPTIONAL {{ ?event <{NAMESPACE}eventPrix> ?prix . }}
            FILTER(?date >= "{start_date}"^^xsd:date && ?date <= "{end_date}"^^xsd:date)
        }}
        """
        return self.execute_query(query)

