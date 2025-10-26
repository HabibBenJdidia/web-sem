from models.base_model import BaseModel
from config import NAMESPACE

class Restaurant(BaseModel):
    def __init__(self, uri=None, nom=None, situe_dans=None, sert=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.situe_dans = situe_dans
        self.sert = sert or []
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Restaurant> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.situe_dans:
            triples += f'<{self.uri}> <{NAMESPACE}situeDans> <{self.situe_dans}> .\n'
        for produit in self.sert:
            triples += f'<{self.uri}> <{NAMESPACE}sert> <{produit}> .\n'
        return triples

