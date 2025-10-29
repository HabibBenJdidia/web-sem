from models.base_model import BaseModel
from config import NAMESPACE

class Restaurant(BaseModel):
    def __init__(self, uri=None, nom=None, situe_dans=None, sert=None, capacite_max=None, **kwargs):
        super().__init__(uri=uri, **kwargs)
        self.nom = nom
        self.situe_dans = situe_dans
        self.sert = sert or []
        self.capacite_max = capacite_max  # Maximum number of guests at the same time
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Restaurant> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> "{self.id}"^^xsd:string .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.situe_dans and self.situe_dans.strip():
            # Clean the URI - remove < > if present and check it's not empty
            clean_situe_dans = self.situe_dans.strip('<>').strip()
            if clean_situe_dans and clean_situe_dans.startswith('http'):
                triples += f'<{self.uri}> <{NAMESPACE}situeDans> <{clean_situe_dans}> .\n'
        if self.capacite_max:
            triples += f'<{self.uri}> <{NAMESPACE}capaciteMax> {self.capacite_max} .\n'
        for produit in self.sert:
            if produit and produit.strip():
                # Clean the URI - remove < > if present
                clean_produit = produit.strip('<>').strip()
                if clean_produit and clean_produit.startswith('http'):
                    triples += f'<{self.uri}> <{NAMESPACE}sert> <{clean_produit}> .\n'
        return triples

