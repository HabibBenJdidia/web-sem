from config import NAMESPACE
import uuid

class BaseModel:
    _id_counter = {}
    
    def __init__(self, id=None, uri=None, **kwargs):
        # Generate ID first
        self.id = id or self._generate_id()
        
        # Set URI - either provided or generated
        if uri:
            self.uri = uri
        else:
            self.uri = self.generate_uri()
        
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def _generate_id(self):
        class_name = self.__class__.__name__
        if class_name not in BaseModel._id_counter:
            BaseModel._id_counter[class_name] = 0
        BaseModel._id_counter[class_name] += 1
        return BaseModel._id_counter[class_name]
    
    def generate_uri(self):
        return f"{NAMESPACE}{self.__class__.__name__}_{self.id}"
    
    def to_sparql_insert(self):
        raise NotImplementedError
    
    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

