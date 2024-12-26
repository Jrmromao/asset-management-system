import UserDetailsView from '@/components/UserDetailsView';

export default async function UserPage({ params }: { params: { id: string } }) {


    const user = {
        id: params.id,
        name: 'João Filipe Romão',
        email: 'joao.romao@example.com',
        department: 'Sales',
        appRole: 'Admin',
        accountType: 'Internal User',
        title: 'CEO',
        employeeId: '123456789'


    };

    return <UserDetailsView user={user} />;
}