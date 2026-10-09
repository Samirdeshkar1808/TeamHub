import React from "react";

import './HeroSection.css';
const HeroSection = () =>{

    return(
        <div className="flex flex-col m-5 p-10 items-center h-screen">
           <div className="logo text-6xl font-bold mb-4 floating-heading">TeamHub</div>
           <div className="text-4xl font-bold opacity-80">Team Coordination & Request Management</div>
           <div className="text-4xl font-medium opacity-70 text-green-700">Made Simple</div>
           <br/>
           <div className="m-3">
             <h1 className="text-2xl opacity-70">Centralize your Teams progress requests , Track progress,<br/> manage tasks , and stay aligned - all in One Place.</h1>
              <div className="flex flex-wrap justify-center m-3">
                <button className="p-1.5 m-3 border-2 border-amber-400 rounded-xl bg-green-300 active:scale-95">Get Started</button>
                <button className="p-1.5 m-3 border-2 border-amber-400 rounded-xl bg-green-300 active:scale-95">Watch Demo</button>
              </div>
            
            </div>
            <div className="flex flex-wrap justify-end">
                <p className="mx-1 p-2 bg-blue-300 border-2 rounded-xl border-blue-300">* For Teams</p>
                <p className="mx-1 p-2 bg-blue-300 border-2 rounded-xl border-blue-300">* For Projects</p>
                <p className="mx-1 p-2 bg-blue-300 border-2 rounded-xl border-blue-300">* For Better Coordination</p>
            </div>
        
        </div>
    )

}

export default HeroSection;