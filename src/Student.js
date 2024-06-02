import React from "react";

function Student({ index, name, enrollment, DeleteStudent }) {
  return (
    <div className="md:flex md:gap-20 border-2 border-zinc-800 rounded-md w-300 pl-5 pr-5 mt-5 pb-2 pt-2 md:justify-between bg-slate-300">
      <div>
        {index}. {name}
      </div>
      <div>{enrollment}</div>
      <button
        onClick={DeleteStudent}
        className=" border-2 border-zinc-800 rounded-md w-20 bg-red-600 hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  );
}

export default Student;
