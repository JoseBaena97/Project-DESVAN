export const initialStore=()=>{
  return{
    auth: localStorage.getItem('token') ? true : false,
    user: null,
    name: null,
    error: null,
    loading: false,
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'auth':
      return {
        ...store, 
        auth:true, 
        user:action.payload.user,
        name:action.payload.user?.username || action.payload.user?.name || null
      }

    case 'logout':
      return{
        ...store,
        auth:false, 
        user:null,
        name:null,
        token:null
      }
    
    case 'setError':
      return{
        ...store,
        error:action.payload
      }

    case 'setLoading':
      return{
        ...store,
        loading:action.payload
      } 
     
   
    default:
      throw Error('Unknown action.');
  }    
}
