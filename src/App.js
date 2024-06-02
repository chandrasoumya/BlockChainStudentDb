import { useEffect, useState } from "react";
import { Web3 } from "web3";
import Student from "./Student";
import abi from "./contract/abi.json";

function App() {
  const [adminInput, setAdminInput] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [enrollmentInput, setEnrollmentInput] = useState("");
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [contractForRead, setContractForRead] = useState(null);
  const [contractForWrite, setContractForWrite] = useState(null);
  const [students, setStudents] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  // getting contract for reading purpose
  async function getContractForRead() {
    const web3 = new Web3(process.env.REACT_APP_ALCHEMY_PROVIDER);
    let contract = new web3.eth.Contract(
      abi,
      process.env.REACT_APP_DEPLOYED_ADDRESS
    );
    setContractForRead(contract);
  }

  // getting contract for writing purpose
  async function getContractForWrite() {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();

      setConnectedAccount(accounts[0]);
      let contract = new web3.eth.Contract(
        abi,
        process.env.REACT_APP_DEPLOYED_ADDRESS
      );
      setContractForWrite(contract);
    } else {
      alert("Please download metamask");
    }
  }

  // function calls for getting contract
  useEffect(() => {
    getContractForRead();
    getContractForWrite();
  }, []);
  window.ethereum.on("accountsChanged", getContractForWrite);

  // function to get owner
  async function getOwner() {
    if (contractForRead) {
      try {
        const ownerAddress = await contractForRead.methods.owner().call();
        return ownerAddress;
      } catch (error) {
        console.error("Error getting owner:", error);
      }
    }
  }

  // function to check admin
  async function isAdmin(address) {
    if (contractForRead) {
      try {
        const check = await contractForRead.methods.admins(address).call();
        return check;
      } catch (error) {
        console.error("Error checking admin:", error);
      }
    }
  }

  // add new admin
  async function addAdmin(address) {
    const err = document.getElementById("err");
    const owner = await getOwner();
    if (connectedAccount !== owner) {
      err.style.color = "darkred";
      setErrMsg("You are not owner !");
    } else {
      if (await isAdmin(address)) {
        err.style.color = "darkred";
        setErrMsg("User is already a admin !");
      } else {
        try {
          err.style.color = "darkgreen";
          setErrMsg("Adding ...");
          await contractForWrite.methods
            .addAdmin(address)
            .send({ from: connectedAccount });
          setErrMsg("Admin added !");
        } catch (error) {
          err.style.color = "darkred";
          setErrMsg("Error adding admin !");
          console.log("Error adding admin:", error);
        }
      }
    }
  }

  // delete admin
  async function deleteAdmin(address) {
    const err = document.getElementById("err");
    const owner = await getOwner();
    if (connectedAccount !== owner) {
      err.style.color = "darkred";
      setErrMsg("You are not owner !");
    } else {
      if (!(await isAdmin(address))) {
        err.style.color = "darkred";
        setErrMsg("User is not a admin !");
      } else if (address === owner) {
        err.style.color = "darkred";
        setErrMsg("Owner can't be deleted !");
      } else {
        try {
          err.style.color = "darkgreen";
          setErrMsg("Deleting ...");
          await contractForWrite.methods
            .deleteAdmin(address)
            .send({ from: connectedAccount });
          setErrMsg("Admin deleted !");
        } catch (error) {
          err.style.color = "darkred";
          setErrMsg("Error deleting admin !");
          console.log("Error deleting admin:", error);
        }
      }
    }
  }

  // function for adding students
  async function addStudent(name, enrollment) {
    const err = document.getElementById("err");
    if (!(await isAdmin(connectedAccount))) {
      err.style.color = "darkred";
      setErrMsg("You are not a admin !");
    } else {
      try {
        err.style.color = "darkgreen";
        setErrMsg("Adding ...");
        await contractForWrite.methods
          .addStudent(name, enrollment)
          .send({ from: connectedAccount });
        setErrMsg("Student added !");
      } catch (error) {
        err.style.color = "darkred";
        setErrMsg("Error adding student !");
        console.log("Error adding student:", error);
      }
    }
  }

  // delete student
  async function deleteStudent(index) {
    const err = document.getElementById("err");
    if (!(await isAdmin(connectedAccount))) {
      err.style.color = "darkred";
      setErrMsg("You are not a admin !");
    } else {
      try {
        err.style.color = "darkgreen";
        setErrMsg("Deleting ...");
        await contractForWrite.methods
          .deleteStudent(index)
          .send({ from: connectedAccount });
        setErrMsg("Student deleted !");
      } catch (error) {
        err.style.color = "darkred";
        setErrMsg("Error deleting student !");
        console.log("Error deleting student:", error);
      }
    }
  }

  // fetch students
  async function fetchStudents() {
    if (contractForRead == null) {
      console.log("Contract instanse is not created");
    } else {
      try {
        let studentCount = await contractForRead.methods.studentCount().call();
        let students = [];
        for (let i = 1; i <= studentCount; i++) {
          let student = await contractForRead.methods.students(i).call();
          students.push(student);
        }
        setStudents(students);
      } catch (error) {
        console.log("Error fetching students: ", error);
      }
    }
  }

  useEffect(() => {
    fetchStudents();
  }, [contractForRead]);

  return (
    <div
      className="App text-center flex flex-col  items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('./background.jpg')" }}
    >
      <h1 className="border-2 border-zinc-800 rounded-md  w-max pl-10 pr-10 pt-2 pb-2 bg-blue-300 text-2xl mt-1">
        Blockchain Student Db
      </h1>
      <br />
      <div className=" flex flex-col md:flex-row gap-3  items-center md:justify-center md:items-start">
        <p>(only owner)</p>
        <input
          onChange={(e) => {
            setAdminInput(e.target.value);
          }}
          className=" border-2 border-zinc-800 rounded-md w-60"
          type="test"
          placeholder="Add admin here"
        />

        <button
          onClick={async () => {
            await addAdmin(adminInput);
          }}
          className=" border-2 border-zinc-800 rounded-md w-20 bg-green-600 hover:bg-green-700"
        >
          Add
        </button>
        <button
          onClick={async () => {
            await deleteAdmin(adminInput);
          }}
          className=" border-2 border-zinc-800 rounded-md w-20 bg-red-600 hover:bg-red-700"
        >
          Delete
        </button>
      </div>
      <br />
      <div className=" flex flex-col md:flex-row gap-3  items-center md:justify-center md:items-start">
        <p>(only admins)</p>
        <input
          onChange={(e) => {
            setStudentInput(e.target.value);
          }}
          className=" border-2 border-zinc-800 rounded-md w-60"
          type="test"
          placeholder="Student's name"
        />
        <input
          onChange={(e) => {
            setEnrollmentInput(e.target.value);
          }}
          className=" border-2 border-zinc-800 rounded-md w-60"
          type="number"
          placeholder="Enrollment number"
        />
        <button
          onClick={() => {
            addStudent(studentInput, enrollmentInput);
          }}
          className=" border-2 border-zinc-800 rounded-md w-20 bg-green-600  hover:bg-green-700"
        >
          Add
        </button>
      </div>
      <div className=" mt-4" id="err">
        {errMsg}
      </div>
      <div>
        {students.map((student, index) => {
          return (
            <Student
              DeleteStudent={() => deleteStudent(index + 1)}
              key={index}
              index={index + 1}
              name={student.name}
              enrollment={student.enrollment.toString()}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
