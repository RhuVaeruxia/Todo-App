import "./App.css";
import { useState, useEffect, useRef } from "react";

// 필터 조건
const FILTER_MAP = {
  All: () => true,
  Done: (task) => task.completed,
  Active: (task) => !task.completed,
};

// Object.keys(객체): 객체의 속성 이름을 문자열 배열로 리턴한다
const FILTER_NAMES = Object.keys(FILTER_MAP);

console.log(FILTER_NAMES);

// 로컬 스토리지를 동기화하는 함수
function saveDoc(tasks) {
  localStorage.setItem("tasks", tasks);
}

// tasks변수의 초기값
const initialTasks = localStorage.getItem("tasks") || "[]";

// 메인 컴포넌트
export default function App() {
  const [tasks, setTasks] = useState(JSON.parse(initialTasks));
  const [filter, setFilter] = useState("All");

  console.log(tasks); // 추적
  console.log(filter);

  //  할일을 추가하는 함수
  function addTask(name) {
    const newTask = {
      id: `todo-${Date.now()}`,
      name,
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];

    setTasks(updatedTasks);
    // 로컬스토리지 동기화
    saveDoc(JSON.stringify(updatedTasks));
  }

  // 할일을 삭제하는 함수
  function deleteTask(id) {
    console.log(id);

    // 전달받은 id와 일치하지 않는 id를 가진 task만 리턴한다
    const remainingTasks = tasks.filter((task) => task.id !== id);

    console.log(remainingTasks);

    setTasks(remainingTasks);

    saveDoc(JSON.stringify(remainingTasks));
  }

  //할일의 완료상태를 다루는 함수
  function toggleTaskCompleted(id) {
    console.log(id);

    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    setTasks(updatedTasks);

    saveDoc(JSON.stringify(updatedTasks));

    console.log(updatedTasks);
  }

  // 할일을 수정하는 함수

  function editTask(id, newName) {
    const editedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, name: newName };
      }
      return task;
    });

    console.log(editedTasks);

    setTasks(editedTasks);

    saveDoc(JSON.stringify(editedTasks));
  }

  //필터 버튼

  const filterButtons = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={filter == name}
      setFilter={setFilter}
    />
  ));

  //할일 목록
  // FILTER_MAP[filter]: 필터링 조건
  const taskList = tasks
    .filter(FILTER_MAP[filter])
    .map((task) => (
      <Todo
        key={task.id}
        id={task.id}
        name={task.name}
        completed={task.completed}
        deleteTask={deleteTask}
        toggleTaskCompleted={toggleTaskCompleted}
        editTask={editTask}
      />
    ));

  return (
    <div className="app-container">
      {/* 제목 */}
      <h1 className="app-title">할일 목록 &#128526; &#127928;</h1>

      {/* 폼 */}
      <Form addTask={addTask} />

      {/* 필터 버튼 */}
      <div className="filter-btn-group">{filterButtons}</div>

      {/* 할일 목록 */}
      <h2 className="remaining">{taskList.length} 개 남았습니다</h2>
      <ul>{taskList}</ul>
    </div>
  );
}

// 폼 컴포넌트
function Form({ addTask }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    e.preventDefault();

    addTask(name);
    // 폼 제출시 input을 비운다
    setName("");
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="add-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
      />
      <button type="submit" className="add-btn" disabled={!name.trim()}>
        추가
      </button>
    </form>
  );
}

// 필터 버튼
function FilterButton({ name, isPressed, setFilter }) {
  return (
    <button
      className={`filter-btn ${isPressed && "active"}`}
      onClick={() => setFilter(name)}
    >
      {name}
    </button>
  );
}

// Todo 컴포넌트
function Todo({
  id,
  name,
  completed,
  deleteTask,
  toggleTaskCompleted,
  editTask,
}) {
  // 템플릿 상태를 결정하는 변수
  const [isEditing, setIsEditing] = useState(false);
  // 새로운 할일 이름
  const [newName, setNewName] = useState("");

  // useRef Hook: 엘리먼트에 접근할 수 있다
  const inputEl = useRef(null);

  // 비동기적으로 작동한다
  useEffect(() => {
    // 수정중일때
    if (isEditing) {
      // useRef는 current 속성에 엘리먼트를 담는다
      // 가상의 엘리먼트가 실제 HTML에 주입되고 난 뒤에 input에 접근할 수 있다
      inputEl.current.focus();
    }
  });

  // 업데이트 폼 제출
  function handleSubmit(e) {
    e.preventDefault();

    editTask(id, newName);

    // 수정 후 다시 뷰템플릿으로 이동한다
    setIsEditing(false);
    setNewName("");
  }

  const viewTemplate = (
    <div className="view-template">
      {/* 할일 이름*/}
      <div className="todo-details">
        <input
          type="checkbox"
          id={id}
          className="todo-checkbox"
          checked={completed}
          onChange={() => toggleTaskCompleted(id)}
        />
        <label htmlFor={id} className="todo-name">
          {name}
        </label>
      </div>

      {/* 버튼 그룹 */}
      <div className="view-btn-group">
        <button className="edit-btn" onClick={() => setIsEditing(true)}>
          수정
        </button>
        <button className="delete-btn" onClick={() => deleteTask(id)}>
          삭제
        </button>
      </div>
    </div>
  );

  const editingTemplate = (
    <form onSubmit={handleSubmit} className="edit-template">
      <input
        type="text"
        className="edit-input"
        onChange={(e) => setNewName(e.target.value)}
        ref={inputEl}
      />
      {/* 버튼그룹 */}
      <div className="edit-btn-group">
        <button
          type="button"
          className="cancel-btn"
          onClick={() => setIsEditing(false)}
        >
          취소
        </button>
        <button type="submit" className="save-btn" disabled={!newName.trim()}>
          저장
        </button>
      </div>
    </form>
  );

  return (
    <li className="todo-item">{isEditing ? editingTemplate : viewTemplate}</li>
  );
}
