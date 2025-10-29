from models.base_model import BaseModel
from config import NAMESPACE

class Destination(BaseModel):
    def __init__(self, uri=None, nom=None, pays=None, climat=None, **kwargs):
        super().__init__(uri=uri, **kwargs)
        self.nom = nom
        self.pays = pays
        self.climat = climat
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Destination> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> "{self.id}"^^xsd:string .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.pays:
            triples += f'<{self.uri}> <{NAMESPACE}pays> "{self.pays}"^^xsd:string .\n'
        if self.climat:
            triples += f'<{self.uri}> <{NAMESPACE}climat> "{self.climat}"^^xsd:string .\n'
        return triples
