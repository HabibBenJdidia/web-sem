from models.transport import Transport
from config import NAMESPACE

class TransportNonMotorise(Transport):
    def to_sparql_insert(self):
        triples = f"<{self.uri}> a <{NAMESPACE}TransportNonMotorise> .\n"
        triples += f'<{self.uri}> <{NAMESPACE}id> {self.id} .\n'
        if self.nom:
            triples += f'<{self.uri}> <{NAMESPACE}nom> "{self.nom}"^^xsd:string .\n'
        if self.type:
            triples += f'<{self.uri}> <{NAMESPACE}type> "{self.type}"^^xsd:string .\n'
        if self.emission_co2_per_km is not None:
            triples += f'<{self.uri}> <{NAMESPACE}emissionCO2PerKm> {self.emission_co2_per_km} .\n'
        return triples
