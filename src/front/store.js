export const initialStore=()=>{
  return{
    message: null,
    register: localStorage.getItem('token') || false,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'auth':
      return {
        ...store, 
        auth:true, 
        user:action.payload.user
      }

    case 'logout':
      return{
        ...store,
        auth:false, //no se si está bien y debería poner un case login? o no porque hace ya login en el auth?
        user:null
      }
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
      
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      throw Error('Unknown action.');
  }    
}
