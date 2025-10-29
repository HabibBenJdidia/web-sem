from models.base_model import BaseModel
from config import NAMESPACE

class ProduitLocal(BaseModel):
    def __init__(self, uri=None, nom=None, saison=None, bio=None, **kwargs):
        super().__init__(uri=uri, **kwargs)
        self.nom = nom
        self.saison = saison
        self.bio = bio
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}ProduitLocal> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> "{self.id}"^^xsd:string .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.saison:
            triples += f'<{self.uri}> <{NAMESPACE}saison> "{self.saison}"^^xsd:string .\n'
        if self.bio is not None:
            bio_val = "true" if self.bio else "false"
            triples += f'<{self.uri}> <{NAMESPACE}bio> {bio_val} .\n'
        return triples
