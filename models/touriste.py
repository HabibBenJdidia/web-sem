from models.user import User
from config import NAMESPACE

class Touriste(User):
    def __init__(self, uri=None, sejourne_dans=None, participe_a=None, se_deplace_par=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.sejourne_dans = sejourne_dans
        self.participe_a = participe_a or []
        self.se_deplace_par = se_deplace_par or []
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Touriste> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.email:
            triples += f'<{self.uri}> <{NAMESPACE}email> "{self.email}"^^xsd:string .\n'
        if self.password:
            triples += f'<{self.uri}> <{NAMESPACE}password> "{self.password}"^^xsd:string .\n'
        if self.age:
            triples += f'<{self.uri}> <{NAMESPACE}age> {self.age} .\n'
        if self.nationalite:
            triples += f'<{self.uri}> <{NAMESPACE}nationalite> "{self.nationalite}"^^xsd:string .\n'
        if self.sejourne_dans:
            triples += f'<{self.uri}> <{NAMESPACE}sejourneDans> <{self.sejourne_dans}> .\n'
        for activite in self.participe_a:
            triples += f'<{self.uri}> <{NAMESPACE}participeA> <{activite}> .\n'
        for transport in self.se_deplace_par:
            triples += f'<{self.uri}> <{NAMESPACE}seDeplacePar> <{transport}> .\n'
        return triples

