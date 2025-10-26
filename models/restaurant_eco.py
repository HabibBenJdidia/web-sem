from models.restaurant import Restaurant
from config import NAMESPACE

class RestaurantEco(Restaurant):
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}RestaurantEco> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.situe_dans:
            triples += f'<{self.uri}> <{NAMESPACE}situeDans> <{self.situe_dans}> .\n'
        for produit in self.sert:
            triples += f'<{self.uri}> <{NAMESPACE}sert> <{produit}> .\n'
        return triples
