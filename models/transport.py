from models.base_model import BaseModel
from config import NAMESPACE

class Transport(BaseModel):
    def __init__(self, uri=None, nom=None, type_=None, emission_co2_per_km=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.type = type_
        self.emission_co2_per_km = emission_co2_per_km
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Transport> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.type:
            triples += f'<{self.uri}> <{NAMESPACE}type> "{self.type}"^^xsd:string .\n'
        if self.emission_co2_per_km is not None:
            triples += f'<{self.uri}> <{NAMESPACE}emissionCO2PerKm> {self.emission_co2_per_km} .\n'
        return triples
