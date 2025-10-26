from models.hebergement import Hebergement
from config import NAMESPACE

class MaisonHote(Hebergement):
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}MaisonHote> .\n"
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
