from models.base_model import BaseModel
from config import NAMESPACE

class Hebergement(BaseModel):
    def __init__(self, uri=None, nom=None, type_=None, prix=None, nb_chambres=None, 
                 niveau_eco=None, situe_dans=None, utilise_energie=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.type = type_
        self.prix = prix
        self.nb_chambres = nb_chambres
        self.niveau_eco = niveau_eco
        self.situe_dans = situe_dans
        self.utilise_energie = utilise_energie
    
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}Hebergement> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.type:
            triples += f'<{self.uri}> <{NAMESPACE}type> "{self.type}"^^xsd:string .\n'
        if self.prix:
            triples += f'<{self.uri}> <{NAMESPACE}prix> {self.prix} .\n'
        if self.nb_chambres:
            triples += f'<{self.uri}> <{NAMESPACE}nbChambres> {self.nb_chambres} .\n'
        if self.niveau_eco:
            triples += f'<{self.uri}> <{NAMESPACE}niveauEco> "{self.niveau_eco}"^^xsd:string .\n'
        if self.situe_dans:
            triples += f'<{self.uri}> <{NAMESPACE}situeDans> <{self.situe_dans}> .\n'
        if self.utilise_energie:
            triples += f'<{self.uri}> <{NAMESPACE}utiliseEnergie> <{self.utilise_energie}> .\n'
        return triples

