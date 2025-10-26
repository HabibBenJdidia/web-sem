from models.base_model import BaseModel
from config import NAMESPACE

class Evenement(BaseModel):
    def __init__(self, uri=None, nom=None, event_date=None, event_duree_heures=None, 
                 event_prix=None, a_lieu_dans=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.event_date = event_date
        self.event_duree_heures = event_duree_heures
        self.event_prix = event_prix
        self.a_lieu_dans = a_lieu_dans
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Evenement> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.event_date:
            triples += f'<{self.uri}> <{NAMESPACE}eventDate> "{self.event_date}"^^xsd:date .\n'
        if self.event_duree_heures:
            triples += f'<{self.uri}> <{NAMESPACE}eventDureeHeures> {self.event_duree_heures} .\n'
        if self.event_prix:
            triples += f'<{self.uri}> <{NAMESPACE}eventPrix> {self.event_prix} .\n'
        if self.a_lieu_dans:
            triples += f'<{self.uri}> <{NAMESPACE}aLieuDans> <{self.a_lieu_dans}> .\n'
        return triples

