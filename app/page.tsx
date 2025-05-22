import { prisma } from './lib/prisma'

export default async function Home() {
  const todos = await prisma.todo.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Todoリスト</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{todo.title}</h3>
                  {todo.description && (
                    <p className="text-gray-600 mt-1">{todo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    todo.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {todo.completed ? '完了' : '未完了'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
} 