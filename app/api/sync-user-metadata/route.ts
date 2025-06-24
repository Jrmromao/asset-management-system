import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/app/db';

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 [Sync User Metadata] Starting sync...');
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 [Sync User Metadata] User ID:', userId);

    // Find the user in the database
    const dbUser = await prisma.user.findFirst({
      where: { oauthId: userId },
      include: {
        company: true,
        role: true
      }
    });

    console.log('🔍 [Sync User Metadata] DB User found:', !!dbUser);

    if (!dbUser) {
      // If user doesn't exist in DB, find the first company to associate them with
      const firstCompany = await prisma.company.findFirst({
        include: {
          roles: {
            where: { name: 'Admin' }
          }
        }
      });

      if (!firstCompany) {
        return NextResponse.json({ error: 'No company found' }, { status: 404 });
      }

      console.log('🔍 [Sync User Metadata] First company:', firstCompany.id);

      // Create user in database
      const newUser = await prisma.user.create({
        data: {
          oauthId: userId,
          email: 'admin@example.com', // This should be updated with real email
          firstName: 'Admin',
          lastName: 'User',
          name: 'Admin User',
          roleId: firstCompany.roles[0]?.id || '',
          companyId: firstCompany.id,
        }
      });

      // Update Clerk metadata
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          userId: newUser.id,
          companyId: firstCompany.id,
          role: 'Admin',
          onboardingComplete: true,
        },
        privateMetadata: {
          companyId: firstCompany.id,
        },
      });

      console.log('✅ [Sync User Metadata] Created new user and synced metadata');
      
      return NextResponse.json({ 
        success: true, 
        message: 'User created and metadata synced',
        companyId: firstCompany.id,
        userId: newUser.id
      });
    }

    // Update Clerk metadata with existing user data
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        userId: dbUser.id,
        companyId: dbUser.companyId,
        role: dbUser.role.name,
        onboardingComplete: true,
      },
      privateMetadata: {
        companyId: dbUser.companyId,
      },
    });

    console.log('✅ [Sync User Metadata] Synced existing user metadata');

    return NextResponse.json({ 
      success: true, 
      message: 'User metadata synced',
      companyId: dbUser.companyId,
      userId: dbUser.id
    });

  } catch (error) {
    console.error('❌ [Sync User Metadata] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user metadata' },
      { status: 500 }
    );
  }
} 