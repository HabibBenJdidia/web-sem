from models.base_model import BaseModel
from config import NAMESPACE

class EnergieRenouvelable(BaseModel):
    def __init__(self, uri=None, nom=None, type_=None, description=None, **kwargs):
        super().__init__(uri, **kwargs)
        self.nom = nom
        self.type = type_
        self.description = description or ""
    
    def to_sparql_insert(self):
        from config import NAMESPACE
        import uuid
        
        # Generate a unique URI if none exists
        if not hasattr(self, 'id') or not self.id:
            self.id = str(uuid.uuid4())
            
        uri = self.uri or f"{NAMESPACE}EnergieRenouvelable_{self.id}"
        
        # Escape special characters in string values
        def escape_sparql(value):
            if not value:
                return ''
            return (str(value)
                   .replace('\\', '\\\\')  # Escape backslashes first
                   .replace('"', '\\"')     # Escape quotes
                   .replace('\n', ' ')         # Replace newlines with spaces
                   .strip())
        
        triples = f"""
        <{uri}> a <{NAMESPACE}EnergieRenouvelable> .
        <{uri}> <{NAMESPACE}id> "{self.id}"^^xsd:string .
        """
        
        if self.nom:
            nom_escaped = escape_sparql(self.nom)
            triples += f'<{uri}> <{NAMESPACE}nom> "{nom_escaped}"^^xsd:string .\n'
        if self.type:
            type_escaped = escape_sparql(self.type)
            triples += f'<{uri}> <{NAMESPACE}type> "{type_escaped}"^^xsd:string .\n'
        if self.description:
            desc_escaped = escape_sparql(self.description)
            triples += f'<{uri}> <{NAMESPACE}description> "{desc_escaped}"^^xsd:string .\n'
        return triples.strip()
    
    def to_dict(self):
        return {
            'uri': self.uri,
            'id': self.id,
            'nom': self.nom,
            'type': self.type,
            'description': self.description
        }
