import { Link } from "react-router-dom"
export default function Home(){

    return(
        <>
         <h1>Hello!</h1>
         <Link to="/login">
          <button type="button">Login</button>
         </Link>
        </>
        
    )
}