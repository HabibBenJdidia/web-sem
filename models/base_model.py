from config import NAMESPACE
import uuid

class BaseModel:
    _id_counter = {}
    
    def __init__(self, id=None, uri=None, **kwargs):
        # Generate ID first (always an integer)
        self.id = id if isinstance(id, int) else self._generate_id()
        # Generate URI - if uri is provided, use it directly
        self.uri = uri if uri else self.generate_uri()
        # Set other attributes
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

