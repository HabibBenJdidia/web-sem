from models.base_model import BaseModel
from config import NAMESPACE

class EmpreinteCarbone(BaseModel):
    def __init__(self, uri=None, valeur_co2_kg=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.valeur_co2_kg = valeur_co2_kg
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}EmpreinteCarbone> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.valeur_co2_kg is not None:
            triples += f'<{self.uri}> <{NAMESPACE}valeurCO2kg> {self.valeur_co2_kg} .\n'
        return triples
