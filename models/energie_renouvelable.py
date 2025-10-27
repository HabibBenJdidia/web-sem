from models.base_model import BaseModel
from config import NAMESPACE

class EnergieRenouvelable(BaseModel):
    def __init__(self, uri=None, nom=None, type_=None, description=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.type = type_
        self.description = description or ""
    
    def to_sparql_insert(self):
        uri = self.uri or f"{NAMESPACE}EnergieRenouvelable_{self.id}"
        triples = f"<{uri}> a <{NAMESPACE}EnergieRenouvelable> .\n"
        triples += f'<{uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.type:
            triples += f'<{uri}> <{NAMESPACE}type> "{self.type}"^^xsd:string .\n'
        if self.description:
            triples += f'<{uri}> <{NAMESPACE}description> "{self.description}"^^xsd:string .\n'
        return triples
    
    def to_dict(self):
        return {
            'uri': self.uri,
            'id': self.id,
            'nom': self.nom,
            'type': self.type,
            'description': self.description
        }
