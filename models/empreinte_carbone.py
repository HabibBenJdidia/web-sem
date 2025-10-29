from models.base_model import BaseModel
from config import NAMESPACE

class EmpreinteCarbone(BaseModel):
    def __init__(self, uri=None, valeur_co2_kg=None, name=None, description=None, image=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.valeur_co2_kg = valeur_co2_kg
        self.name = name
        self.description = description
        self.image = image
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}EmpreinteCarbone> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.valeur_co2_kg is not None:
            triples += f'<{self.uri}> <{NAMESPACE}valeur_co2_kg> \"{self.valeur_co2_kg}\"^^<{NAMESPACE}xsd:float> .\n'
        if self.name is not None:
            triples += f'<{self.uri}> <{NAMESPACE}name> \"{self.name}\"^^<{NAMESPACE}xsd:string> .\n'
        if self.description is not None:
            triples += f'<{self.uri}> <{NAMESPACE}description> \"{self.description}\"^^<{NAMESPACE}xsd:string> .\n'
        if self.image is not None:
            triples += f'<{self.uri}> <{NAMESPACE}image> \"{self.image}\"^^<{NAMESPACE}xsd:string> .\n'
        return triples
