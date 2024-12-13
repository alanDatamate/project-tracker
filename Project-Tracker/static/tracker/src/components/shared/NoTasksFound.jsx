import { FiAlertCircle } from 'react-icons/fi';

const NoTasksFound = ({ desc }) => {
  return (
    <section className="flex items-center justify-center">
      <header className="text-center">
        <FiAlertCircle size={50} className="text-yellow-500 mx-auto" />
        <p className="text-yellow-500 mt-2">No {desc} found!</p>
      </header>
    </section>
  );
};

export default NoTasksFound;
