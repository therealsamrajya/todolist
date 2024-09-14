
import { motion } from 'framer-motion';

const steps = [
  { id: 1, title: 'Login', description: 'Sign in to your account' },
  { id: 2, title: 'Register', description: 'Create a new account if you don\'t have one' },
  { id: 3, title: 'Create Task', description: 'Add a new task to your list' },
];

const TaskSteps = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Steps to Create a Task</h2>
      <ul className="space-y-4">
        {steps.map((step, index) => (
          <motion.li
            key={step.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="flex items-start space-x-4"
          >
            <div className="flex-shrink-0">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold">
                {step.id}
              </span>
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default TaskSteps;