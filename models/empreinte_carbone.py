from models.base_model import BaseModel
from config import NAMESPACE

class EmpreinteCarbone(BaseModel):
    def __init__(self, uri=None, valeur_co2_kg=None, **kwargs):
        super().__init__(uri=uri, **kwargs)
        self.valeur_co2_kg = valeur_co2_kg
    
    def to_sparql_insert(self):
        """Generate SPARQL triples for EmpreinteCarbone"""
        triples = f"<{self.uri}> a <{NAMESPACE}EmpreinteCarbone> .\n"
        
        if self.valeur_co2_kg is not None:
            triples += f'<{self.uri}> <{NAMESPACE}valeurCO2kg> "{self.valeur_co2_kg}"^^xsd:decimal .\n'
            
            # Automatically classify as EmpreinteCarboneFaible if <= 1.0 kg
            if float(self.valeur_co2_kg) <= 1.0:
                triples += f"<{self.uri}> a <{NAMESPACE}EmpreinteCarboneFaible> .\n"
        
        return triples.rstrip('\n')
    
    @staticmethod
    def get_category(valeur_co2_kg):
        """Get the category label based on CO2 value"""
        if valeur_co2_kg is None:
            return "Non spécifié"
        
        val = float(valeur_co2_kg)
        if val == 0:
            return "Zéro émission"
        elif val <= 1.0:
            return "Faible"
        elif val <= 5.0:
            return "Moyenne"
        else:
            return "Élevée"
    
    @staticmethod
    def get_category_color(valeur_co2_kg):
        """Get color code for category"""
        if valeur_co2_kg is None:
            return "gray"
        
        val = float(valeur_co2_kg)
        if val == 0:
            return "green"
        elif val <= 1.0:
            return "light-green"
        elif val <= 5.0:
            return "orange"
        else:
            return "red"
