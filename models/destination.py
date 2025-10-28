# models/destination.py
from models.base_model import BaseModel
from config import NAMESPACE

class Destination(BaseModel):
    def __init__(self, uri=None, nom=None, pays=None, climat=None, **kwargs):
        super().__init__(uri=uri, **kwargs)  # Let BaseModel generate URI if none provided
        self.nom = nom
        self.pays = pays
        self.climat = climat
    
    def to_sparql_insert(self):
        """Generate SPARQL INSERT DATA triples for this Destination instance."""
        triples = f"<{self.uri}> a <{NAMESPACE}Destination> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> "{self.id}"^^<http://www.w3.org/2001/XMLSchema#integer> .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^<http://www.w3.org/2001/XMLSchema#string> .\n'
        if self.pays:
            triples += f'<{self.uri}> <{NAMESPACE}pays> "{self.pays}"^^<http://www.w3.org/2001/XMLSchema#string> .\n'
        if self.climat:
            triples += f'<{self.uri}> <{NAMESPACE}climat> "{self.climat}"^^<http://www.w3.org/2001/XMLSchema#string> .\n'
        # Print for debugging (remove in production)
        # print(f"Generated triples for {self.uri}: {triples}")
        return triples