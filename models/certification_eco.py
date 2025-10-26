from models.base_model import BaseModel
from config import NAMESPACE

class CertificationEco(BaseModel):
    def __init__(self, uri=None, label_nom=None, organisme=None, annee_obtention=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.label_nom = label_nom
        self.organisme = organisme
        self.annee_obtention = annee_obtention
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}CertificationEco> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.label_nom:
            triples += f'<{self.uri}> <{NAMESPACE}labelNom> "{self.label_nom}"^^xsd:string .\n'
        if self.organisme:
            triples += f'<{self.uri}> <{NAMESPACE}organisme> "{self.organisme}"^^xsd:string .\n'
        if self.annee_obtention:
            triples += f'<{self.uri}> <{NAMESPACE}anneeObtention> "{self.annee_obtention}"^^xsd:date .\n'
        return triples
