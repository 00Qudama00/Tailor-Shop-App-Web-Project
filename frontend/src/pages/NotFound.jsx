import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import Empty from '../components/Empty';

export default function NotFound() {
  return (
    <div className="card">
      <Empty icon={Scissors} title="Page not found" text="The page you are looking for does not exist">
        <Link to="/" className="btn btn-primary">
          Go to dashboard
        </Link>
      </Empty>
    </div>
  );
}
