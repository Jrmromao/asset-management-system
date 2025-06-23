import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { EmailService } from "@/services/email";
import { z } from "zod";

// Validation schema for contact form
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  inquiryType: z.string().min(1, "Inquiry type is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  phoneNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);
    
    // Get client IP address and user agent
    const ipAddress = request.headers.get("x-forwarded-for") || 
      request.headers.get("x-forwarded-for")?.split(",")[0] || 
      request.headers.get("x-real-ip") || 
      "unknown";
    
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    // Save to database
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        ...validatedData,
        ipAddress,
        userAgent,
      },
    });
    
    // Send email notifications
    try {
      // Send confirmation email to user
      await EmailService.sendEmail({
        to: validatedData.email,
        subject: "Thank you for contacting EcoKeepr",
        templateName: "contactConfirmation",
        templateData: {
          firstName: validatedData.firstName,
          inquiryType: validatedData.inquiryType,
        },
      });
      
      // Send notification email to admin
      await EmailService.sendEmail({
        to: "joao.romao@ecokeepr.com", // Replace with your admin email
        subject: `New Contact Form Submission - ${validatedData.inquiryType}`,
        templateName: "contactNotification",
        templateData: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          company: validatedData.company,
          jobTitle: validatedData.jobTitle,
          inquiryType: validatedData.inquiryType,
          message: validatedData.message,
          phoneNumber: validatedData.phoneNumber,
          submissionId: contactSubmission.id,
          submittedAt: contactSubmission.createdAt.toISOString(),
        },
      });
    } catch (emailError) {
      console.error("Failed to send email notifications:", emailError);
      // Don't fail the entire request if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      submissionId: contactSubmission.id,
    });
    
  } catch (error) {
    console.error("Contact form submission error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit contact form",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve contact submissions (for admin use)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const unreadOnly = searchParams.get("unread") === "true";
    const inquiryType = searchParams.get("inquiryType");
    
    const skip = (page - 1) * limit;
    
    const where = {
      ...(unreadOnly && { isRead: false }),
      ...(inquiryType && { inquiryType }),
    };
    
    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactSubmission.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error("Failed to fetch contact submissions:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contact submissions",
      },
      { status: 500 }
    );
  }
} 