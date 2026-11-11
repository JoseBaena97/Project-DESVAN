export const initialStore=()=>{
  return{
    auth: localStorage.getItem('token') ? true : false,
    user: null,
    name: null,
    error: null,
    loading: false,
    userLoading: localStorage.getItem('token') ? true : false,
    notifications: [],
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'auth':
      return {
        ...store, 
        auth:true, 
        user:action.payload.user,
        name:action.payload.user?.username || action.payload.user?.name || null,
        userLoading: false
      }

    case 'logout':
      return{
        ...store,
        auth:false,
        user:null,
        name:null,
        token:null,
        userLoading: false,
        notifications: [],
      }

    case 'setNotifications':
      return{
        ...store,
        notifications: action.payload
      }

    case 'markAllRead':
      return{
        ...store,
        notifications: store.notifications.map(n => ({ ...n, is_read: true }))
      }

    case 'deleteNotification':
      return{
        ...store,
        notifications: store.notifications.filter(n => n.id !== action.payload)
      }

    case 'clearNotifications':
      return{
        ...store,
        notifications: []
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
    case 'setUserLoading':
      return{
        ...store,
        userLoading:action.payload
      } 
     
   
    default:
      throw Error('Unknown action.');
  }    
}
