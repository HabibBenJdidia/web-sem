from models.user import User
from config import NAMESPACE

class Guide(User):
    def __init__(self, uri=None, organise=None, organise_evenement=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.organise = organise or []
        self.organise_evenement = organise_evenement or []
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Guide> .\n"
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
        for activite in self.organise:
            triples += f'<{self.uri}> <{NAMESPACE}organise> <{activite}> .\n'
        for evenement in self.organise_evenement:
            triples += f'<{self.uri}> <{NAMESPACE}organiseEvenement> <{evenement}> .\n'
        return triples
