import React from "react";

const Navbar = () =>{

    return(
        <div className="flex flex-wrap h-16 justify-around items-center m-3  bg-amber-50 border-2 border-amber-400 rounded-2xl ">
            <div className="h-[80%] flex flex-wrap">
                <img className="h-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRApyOGpKnMI-y5-eZ7ijqYfWidNtkxbL55O4xoruO3PA&s=10" alt="logo" />
                <h4 className="m-3">TeamHub</h4>
            </div>
           
            <div className="flex flex-wrap justify-around basis-1/2">
                <h4 className="m-3">Home</h4>
                <h4 className="m-3">Features</h4>
                <h4 className="m-3">FAQ</h4>
            </div>

            <div className="flex flex-wrap justify-around">
                <button className="p-2 m-3 border-2 border-blue-200 rounded-xl bg-cyan-50 active:scale-95 active:bg-cyan-200">Login</button>
                <button className="p-2 m-3 border-2 border-cyan-200 rounded-xl bg-blue-50 active:scale-95 active:bg-cyan-200">Get Started</button>
            </div>
            
        </div>
    )
}

export default Navbar;