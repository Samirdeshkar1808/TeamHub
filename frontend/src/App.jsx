import React from "react";
import { Routes , Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./ProtectedRoute";
import MyTasks from "./pages/MyTasks";
import MyRequests from "./pages/MyRequests";
import Organizations from "./pages/Organizations";
import OrganizationDetails from "./pages/OrganizationDetails";
import Teams from "./pages/MyTeams";
import TeamDetails from "./pages/MyTeamDetails";
import TeamWorkspace from "./pages/TeamWorkspace";
const App = () =>{

  return(
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />

      <Route element={<ProtectedRoute/>}>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/my-tasks" element={<MyTasks/>} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:organizationId" element={<OrganizationDetails />}/>
        <Route path="/teams" element={<Teams/>} />
        <Route path="/teams/:teamId" element={<TeamDetails/>} />
        <Route path="/teams/:teamId/workspace" element={<TeamWorkspace />}/>
      </Route>
      
    </Routes> 
  )
}


export default App;