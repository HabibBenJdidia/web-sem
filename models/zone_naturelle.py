from models.base_model import BaseModel
from config import NAMESPACE

class ZoneNaturelle(BaseModel):
    def __init__(self, uri=None, nom=None, type_=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.type = type_
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}ZoneNaturelle> .\n"
        if self.id is not None:
            triples += f'<{self.uri}> <{NAMESPACE}id> "{self.id}"^^xsd:integer .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.type:
            triples += f'<{self.uri}> <{NAMESPACE}type> "{self.type}"^^xsd:string .\n'
        return triples
