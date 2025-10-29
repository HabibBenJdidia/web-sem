from models.evenement import Evenement
from config import NAMESPACE

class Festival(Evenement):
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Festival> .\n"
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
