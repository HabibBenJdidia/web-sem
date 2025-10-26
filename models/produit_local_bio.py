from models.produit_local import ProduitLocal
from config import NAMESPACE

class ProduitLocalBio(ProduitLocal):
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}ProduitLocalBio> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.saison:
            triples += f'<{self.uri}> <{NAMESPACE}saison> "{self.saison}"^^xsd:string .\n'
        triples += f'<{self.uri}> <{NAMESPACE}bio> true .\n'
        return triples
