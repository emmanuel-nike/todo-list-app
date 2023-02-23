import React, { useState, useEffect } from 'react';
import SQLite from "react-native-sqlite-storage";
import { Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';
import TaskInputField from './components/TaskInputField';
import TaskItem from './components/TaskItem';

//SQLite.enablePromise(true);

const DB_NAME = "todo-data.db";
const TABLE_NAME = "todoItems";

function openCB() {
  console.log('open!')
}
function errorCB(err) {
  console.log(err)
}

const db = SQLite.openDatabase(DB_NAME, "1.0", "Todo Items Database", 200000, openCB, errorCB);

export default function App() {
  const [tasks, setTasks] = useState([]);

  //const [db, setDb] = useState(null);

  const addTask = (task) => {
    if (task == null) return;
    let id = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
    const taskObject = { id: id, item: task, created_at: new Date() };
    setTasks([...tasks, taskObject]);
    Keyboard.dismiss();
    if (db == null) return;
    db.transaction((tx) => {
      const query = "INSERT INTO " + TABLE_NAME + " (id, item, created_at) VALUES (" + taskObject.id + ", '" + taskObject.item + "', '" + taskObject.created_at + "');";
      tx.executeSql(query, [], (tx, result) => {
        console.log(result);
      })
    });
  }

  const deleteTask = (deleteId) => {
    setTasks(tasks.filter((value, index) => value.id != deleteId));
    if (db == null) return;
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM ' + TABLE_NAME + ' WHERE id=\'' + deleteId + '\';', [], (tx, result) => {
        console.log(result);
      })
    });
  }

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS todoItems (id INTEGER, item TEXT, created_at NUMERIC);');
    });
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM ' + TABLE_NAME + ';', [], (tx, result) => {
        console.log(result);
        const todoTasks = [];
        for (let i = 0; i < result.rows.length; i++) {
          todoTasks.push(result.rows.item(i));
        }
        setTasks([...todoTasks]);
      })
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>TODO LIST</Text>
      <ScrollView style={styles.scrollView}>
        {
          tasks.map((task, index) => {
            return (
              <View key={index} style={styles.taskContainer}>
                <TaskItem index={index + 1} task={task.item} deleteTask={() => deleteTask(task.id)} />
              </View>
            );
          })
        }
      </ScrollView>
      <TaskInputField addTask={addTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D7874',
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 10,
    marginLeft: 20,
  },
  scrollView: {
    marginBottom: 60,
  },
  taskContainer: {
    marginTop: 20,
  }
});


