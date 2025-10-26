from models.base_model import BaseModel
from config import NAMESPACE

class User(BaseModel):
    def __init__(self, uri=None, nom=None, age=None, nationalite=None, email=None, password=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.age = age
        self.nationalite = nationalite
        self.email = email
        self.password = password
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}User> .\n"
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
        return triples
