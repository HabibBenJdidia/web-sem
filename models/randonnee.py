from models.activite import Activite
from config import NAMESPACE

class Randonnee(Activite):
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Randonnee> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.difficulte:
            triples += f'<{self.uri}> <{NAMESPACE}difficulte> "{self.difficulte}"^^xsd:string .\n'
        if self.duree_heures:
            triples += f'<{self.uri}> <{NAMESPACE}dureeHeures> {self.duree_heures} .\n'
        if self.prix:
            triples += f'<{self.uri}> <{NAMESPACE}prix> {self.prix} .\n'
        if self.est_dans_zone:
            triples += f'<{self.uri}> <{NAMESPACE}estDansZone> <{self.est_dans_zone}> .\n'
        return triples
