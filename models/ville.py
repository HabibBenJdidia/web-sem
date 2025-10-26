from models.destination import Destination
from config import NAMESPACE

class Ville(Destination):
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Ville> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.pays:
            triples += f'<{self.uri}> <{NAMESPACE}pays> "{self.pays}"^^xsd:string .\n'
        if self.climat:
            triples += f'<{self.uri}> <{NAMESPACE}climat> "{self.climat}"^^xsd:string .\n'
        return triples
