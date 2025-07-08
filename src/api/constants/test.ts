import { TreeNode } from "primevue/treenode";
import { Todo } from "../types/todo";
import type { UserData } from "../types/user";
import { Note, NoteTreeNode } from "../types/note";

export const testTodo: Todo[] = [
  {
    info: {
      id: '1',
      title: 'Test Todo',
      description: 'This is a test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-14T00:00:00Z'),
      priority: 2,
      tags: ['test', 'todo'],
      note_link: 'example-note-1'
    },
    status: {
      completed: 'not-started'
    }
  },
  {
    info: {
      id: '2',
      title: 'Another Test Todo',
      description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
  {
    info: {
      id: '3',
      title: 'Test Todo',
      description: 'This is a test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-14T00:00:00Z'),
      priority: 2,
      tags: ['test', 'todo'],
      note_link: 'example-note-1'
    },
    status: {
      completed: 'not-started'
    }
  },
  {
    info: {
      id: '4',
      title: 'Another Test Todo',
      description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
  {
    info: {
      id: '5',
      title: 'Test Todo',
      description: 'This is a test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-14T00:00:00Z'),
      priority: 2,
      tags: ['test', 'todo'],
      note_link: 'example-note-1'
    },
    status: {
      completed: 'not-started'
    }
  },
  {
    info: {
      id: '6',
      title: 'Another Test Todo',
      description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
  {
    info: {
      id: '7',
      title: 'Test Todo',
      description: 'This is a test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-14T00:00:00Z'),
      priority: 2,
      tags: ['test', 'todo'],
      note_link: 'example-note-1'
    },
    status: {
      completed: 'not-started'
    }
  },
  {
    info: {
      id: '8',
      title: 'Another Test Todo',
      description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
  {
    info: {
      id: '9',
      title: 'Test Todo',
      description: 'This is a test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-14T00:00:00Z'),
      priority: 2,
      tags: ['test', 'todo'],
      note_link: 'example-note-1'
    },
    status: {
      completed: 'not-started'
    }
  },
  {
    info: {
      id: '10',
      title: 'Another Test Todo',
      description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
  {
    info: {
      id: '11',
      title: 'Test Todo',
      description: 'This is a test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-14T00:00:00Z'),
      priority: 2,
      tags: ['test', 'todo'],
      note_link: 'example-note-1'
    },
    status: {
      completed: 'not-started'
    }
  },
  {
    info: {
      id: '12',
      title: 'Another Test Todo',
      description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
  {
    info: {
      id: '13',
      title: 'Test Todo',
      description: 'This is a test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-14T00:00:00Z'),
      priority: 2,
      tags: ['test', 'todo'],
      note_link: 'example-note-1'
    },
    status: {
      completed: 'not-started'
    }
  },
  {
    info: {
      id: '14',
      title: 'Another Test Todo',
      description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
  {
    info: {
      id: '15',
      title: 'Test Todo',
      description: 'This is a test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-14T00:00:00Z'),
      priority: 2,
      tags: ['test', 'todo'],
      note_link: 'example-note-1'
    },
    status: {
      completed: 'not-started'
    }
  },
  {
    info: {
      id: '16',
      title: 'Another Test Todo',
      description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
  {
  info: {
      id: '17',
    title: 'Test Todo',
    description: 'This is a test todo item.',
    create: new Date('2025-07-06T19:00:00Z'),
    ddl: new Date('2025-07-14T00:00:00Z'),
    priority: 2,
    tags: ['test', 'todo'],
    note_link: 'example-note-1'
  },
  status: {
    completed: 'not-started'
  }
},
  {
  info: {
      id: '18',
    title: 'Another Test Todo',
    description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  },
];

export const testUserData: UserData = {
  info: {
    id: "c3fea732-28d2-4320-8e32-a6c89314e8fd",
    email: "test@test.com",
    username: "test-user",
  },
  store: {
    todo: testTodo
  }
};

export const testTreeData: NoteTreeNode[] = [
  {
    key: "0", label: "Root", children: [
      { key: "0-0", label: "Child 1" },
      { key: "0-1", label: "Child 2" }
    ]
  },
  {
    key: "1", label: "Root 2", children: [
      { key: "1-0", label: "Child 3" },
      { key: "1-1", label: "Child 4" }
    ]
  }
]

export const testNote: Note = {
  meta: {
    id: "note-1",
    title: "Test Note",
    create: new Date("2025-07-06T19:00:00Z"),
    modified: new Date("2025-07-07T19:00:00Z"),
    tags: ["test", "note"]
  },
  content: "This is a test note content."
}