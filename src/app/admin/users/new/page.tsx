import { UserEditor } from '../user-editor';

export default function NewUserPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold font-serif text-shpc-dark">Add New Member</h1>
            <UserEditor />
        </div>
    );
}
