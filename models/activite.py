from models.base_model import BaseModel
from config import NAMESPACE

class Activite(BaseModel):
    def __init__(self, uri=None, nom=None, difficulte=None, duree_heures=None, 
                 prix=None, est_dans_zone=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.difficulte = difficulte
        self.duree_heures = duree_heures
        self.prix = prix
        self.est_dans_zone = est_dans_zone
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Activite> .\n"
        if self.id is not None:
            triples += f'<{self.uri}> <{NAMESPACE}id> "{self.id}"^^xsd:integer .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.difficulte:
            triples += f'<{self.uri}> <{NAMESPACE}difficulte> "{self.difficulte}"^^xsd:string .\n'
        if self.duree_heures is not None:
            triples += f'<{self.uri}> <{NAMESPACE}dureeHeures> "{self.duree_heures}"^^xsd:double .\n'
        if self.prix is not None:
            triples += f'<{self.uri}> <{NAMESPACE}prix> "{self.prix}"^^xsd:double .\n'
        if self.est_dans_zone:
            triples += f'<{self.uri}> <{NAMESPACE}estDansZone> <{self.est_dans_zone}> .\n'
        return triples

