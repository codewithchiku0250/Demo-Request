const DemoRequest = require('../models/DemoRequest');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Helper to generate unique request ID
const generateRequestId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DEMO-${dateStr}-${randChars}`;
};

// Create a reusable Nodemailer transporter using environment variables
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('[Email Warning] SMTP credentials not set in env. Emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send Admin Notification Email
const sendAdminNotification = async (reqDetails) => {
  const transporter = createTransporter();
  const companyName = process.env.COMPANY_NAME || 'PixelCraft Studios';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const serverUrl = `${reqDetails.protocol}://${reqDetails.host}`;

  const logoLink = reqDetails.logoUrl ? `${serverUrl}${reqDetails.logoUrl}` : 'No Logo Uploaded';
  const photosLinks = reqDetails.photosUrls.length > 0 
    ? reqDetails.photosUrls.map((p, i) => `<a href="${serverUrl}${p}" target="_blank">Photo ${i+1}</a>`).join(', ')
    : 'No Photos Uploaded';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6; padding: 30px; color: #1f2937;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">New Demo Request Received!</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">ID: <strong>${reqDetails.requestId}</strong></p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Hello Admin, you have received a new business demo website/app request from <strong>${reqDetails.fullName}</strong>.
          </p>

          <!-- Core details table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb; width: 35%;">Client Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${reqDetails.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Business Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${reqDetails.businessName}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Business Type:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><span style="background-color: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">${reqDetails.businessType}</span></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Required Service:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><span style="background-color: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">${reqDetails.requiredService}</span></td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Mobile & WhatsApp:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                Call: <a href="tel:${reqDetails.mobile}" style="color: #4f46e5; text-decoration: none;">${reqDetails.mobile}</a> <br/>
                WhatsApp: <a href="https://wa.me/${reqDetails.whatsapp?.replace(/\+/g, '')}" style="color: #10b981; text-decoration: none; font-weight: bold;">${reqDetails.whatsapp || 'N/A'}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${reqDetails.email}" style="color: #4f46e5; text-decoration: none;">${reqDetails.email}</a></td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Location:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${reqDetails.businessAddress || 'N/A'}, ${reqDetails.cityState || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Budget Range:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${reqDetails.budgetRange || 'Not Specified'}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Preferred Theme:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                <span style="display: inline-block; width: 14px; height: 14px; background-color: ${reqDetails.preferredColor}; border-radius: 3px; vertical-align: middle; margin-right: 5px;"></span>
                <code>${reqDetails.preferredColor}</code>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Features:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${reqDetails.featuresRequired?.join(', ') || 'None selected'}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Reference Link:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${reqDetails.referenceLink ? `<a href="${reqDetails.referenceLink}" target="_blank" style="color: #4f46e5;">${reqDetails.referenceLink}</a>` : 'None'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Deadline:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${reqDetails.deadline ? new Date(reqDetails.deadline).toLocaleDateString() : 'Flexible'}</td>
            </tr>
          </table>

          <div style="margin-bottom: 25px;">
            <h4 style="margin: 0 0 8px 0; color: #374151;">Business Description:</h4>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; font-style: italic; line-height: 1.4;">
              ${reqDetails.businessDescription || 'No description provided.'}
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h4 style="margin: 0 0 8px 0; color: #374151;">Uploaded Assets:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Logo:</strong> ${reqDetails.logoUrl ? `<a href="${logoLink}" target="_blank">View Logo</a>` : 'Not Uploaded'}</li>
              <li><strong>Photos:</strong> ${photosLinks}</li>
            </ul>
          </div>

          <!-- CTA to Admin Dashboard -->
          <div style="text-align: center; margin-top: 35px;">
            <a href="${serverUrl}/admin.html" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 6px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
              Open Admin Dashboard
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          Sent automatically by your web agency backend. © ${new Date().getFullYear()} ${companyName}.
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${companyName} System" <${process.env.SMTP_USER || 'system@example.com'}>`,
    to: adminEmail,
    subject: `🚨 DEMO REQUEST: ${reqDetails.businessName} - ${reqDetails.businessType}`,
    html: htmlContent
  };

  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Alert] Admin notification sent successfully for ID ${reqDetails.requestId}`);
  } else {
    console.log(`\n======================= [ADMIN EMAIL LOG - ${reqDetails.requestId}] =======================`);
    console.log(`TO: ${adminEmail}`);
    console.log(`SUBJECT: ${mailOptions.subject}`);
    console.log(`CLIENT: ${reqDetails.fullName} | ${reqDetails.businessName}`);
    console.log(`MOBILE: ${reqDetails.mobile} | WHATSAPP: ${reqDetails.whatsapp}`);
    console.log(`SERVICES: ${reqDetails.requiredService}`);
    console.log(`LOGO: ${logoLink}`);
    console.log(`PHOTOS: ${reqDetails.photosUrls.join(', ')}`);
    console.log(`=================================================================================\n`);
  }
};

// Send Client Thank You Confirmation Email
const sendClientConfirmation = async (reqDetails) => {
  const transporter = createTransporter();
  const companyName = process.env.COMPANY_NAME || 'PixelCraft Studios';
  const companyEmail = process.env.COMPANY_EMAIL || 'hello@pixelcraftstudios.com';
  const companyPhone = process.env.COMPANY_PHONE || '+1234567890';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6; padding: 30px; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Thank You for Your Demo Request!</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">We are exciting to build a custom demo for your business.</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; line-height: 1.6;">Hi ${reqDetails.fullName},</p>
          <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
            Thank you for reaching out to <strong>${companyName}</strong>. We have received your demo request details for <strong>${reqDetails.businessName}</strong>.
          </p>

          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #065f46;">
              <strong>Your Request ID:</strong> <code style="background-color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${reqDetails.requestId}</code>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #065f46;">
              <strong>Estimated Response Time:</strong> Within 24 to 48 Hours.
            </p>
          </div>

          <h3 style="color: #1f2937; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-top: 25px;">Next Steps:</h3>
          <ol style="padding-left: 20px; line-height: 1.6; color: #4b5563; font-size: 14px;">
            <li style="margin-bottom: 10px;">Our development team will analyze your business requirements (${reqDetails.requiredService} for a ${reqDetails.businessType}).</li>
            <li style="margin-bottom: 10px;">We will contact you via <strong>WhatsApp (${reqDetails.whatsapp || reqDetails.mobile})</strong> or Call to discuss specific branding and page flows.</li>
            <li style="margin-bottom: 10px;">We will construct a <strong>live interactive web or app demo</strong> completely customized to your brand color (<code>${reqDetails.preferredColor}</code>) at absolutely no upfront cost!</li>
          </ol>

          <p style="margin-top: 30px; font-size: 14px; line-height: 1.6; color: #4b5563;">
            If you have any urgent attachments or questions, feel free to respond directly to this email or chat with us on WhatsApp.
          </p>

          <!-- Footer Signature -->
          <div style="margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">Best Regards,</p>
            <p style="margin: 2px 0 0 0; font-size: 14px; color: #4b5563; font-weight: 600;">The Design & Development Team</p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #6b7280;">${companyName}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
              Email: <a href="mailto:${companyEmail}" style="color: #10b981; text-decoration: none;">${companyEmail}</a> | Phone: ${companyPhone}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${companyName} Team" <${process.env.SMTP_USER || 'support@example.com'}>`,
    to: reqDetails.email,
    subject: `🎯 Your Business Demo Request has been received! [ID: ${reqDetails.requestId}]`,
    html: htmlContent
  };

  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Alert] Client confirmation sent successfully to ${reqDetails.email}`);
  } else {
    console.log(`\n======================= [CLIENT EMAIL LOG - ${reqDetails.requestId}] =======================`);
    console.log(`TO: ${reqDetails.email}`);
    console.log(`SUBJECT: ${mailOptions.subject}`);
    console.log(`Thank you letter printed in logs for client: ${reqDetails.fullName}`);
    console.log(`==================================================================================\n`);
  }
};

// @desc    Submit new demo request
// @route   POST /api/requests/submit
// @access  Public
const submitRequest = async (req, res) => {
  try {
    const {
      fullName,
      businessName,
      mobile,
      whatsapp,
      email,
      businessType,
      businessAddress,
      cityState,
      requiredService,
      businessDescription,
      preferredColor,
      featuresRequired,
      budgetRange,
      deadline,
      referenceLink,
      additionalNotes
    } = req.body;

    // Server-side validation
    if (!fullName || !businessName || !mobile || !email || !businessType || !requiredService) {
      return res.status(400).json({
        success: false,
        message: 'Required details are missing. Please complete all highlighted fields.'
      });
    }

    // Extract file names if uploaded
    let logoUrl = '';
    let photosUrls = [];

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        logoUrl = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.photos) {
        photosUrls = req.files.photos.map(file => `/uploads/${file.filename}`);
      }
    }

    // Parse features required if it came as a single string/JSON
    let parsedFeatures = [];
    if (featuresRequired) {
      try {
        parsedFeatures = Array.isArray(featuresRequired) 
          ? featuresRequired 
          : JSON.parse(featuresRequired);
      } catch (e) {
        // Fallback for form-data text formats
        parsedFeatures = typeof featuresRequired === 'string' 
          ? featuresRequired.split(',').map(f => f.trim()) 
          : [];
      }
    }

    const requestId = generateRequestId();

    // Create MongoDB Document
    const newRequest = await DemoRequest.create({
      requestId,
      fullName,
      businessName,
      mobile,
      whatsapp: whatsapp || mobile,
      email,
      businessType,
      businessAddress,
      cityState,
      requiredService,
      businessDescription,
      logoUrl,
      photosUrls,
      preferredColor: preferredColor || '#10b981',
      featuresRequired: parsedFeatures,
      budgetRange,
      deadline: deadline ? new Date(deadline) : null,
      referenceLink,
      additionalNotes,
      status: 'New'
    });

    // Send notifications (async, don't block user response)
    const emailDetails = {
      protocol: req.protocol,
      host: req.get('host'),
      ...newRequest._doc
    };

    sendAdminNotification(emailDetails).catch(err => console.error('Admin notification error:', err.message));
    sendClientConfirmation(emailDetails).catch(err => console.error('Client confirmation error:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully!',
      requestId,
      estimatedTime: '24-48 Hours',
      data: newRequest
    });

  } catch (error) {
    console.error(`[Submission Request Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while saving your request. Please try again.'
    });
  }
};

// @desc    Get all requests (with search, filters & sorting)
// @route   GET /api/requests
// @access  Private (Admin only)
const getAllRequests = async (req, res) => {
  try {
    const { search, businessType, status, service, sortBy } = req.query;

    const queryObj = {};

    // Filters
    if (businessType) queryObj.businessType = businessType;
    if (status) queryObj.status = status;
    if (service) queryObj.requiredService = service;

    // Search query: searches client name, business name, phone, email, and ID
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      queryObj.$or = [
        { requestId: searchRegex },
        { fullName: searchRegex },
        { businessName: searchRegex },
        { mobile: searchRegex },
        { email: searchRegex },
        { cityState: searchRegex }
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default: newest first
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'name') {
      sortOptions = { fullName: 1 };
    } else if (sortBy === 'businessName') {
      sortOptions = { businessName: 1 };
    }

    const requests = await DemoRequest.find(queryObj).sort(sortOptions);

    // Compute simple metrics for dashboard headers
    const totalCount = await DemoRequest.countDocuments();
    const newCount = await DemoRequest.countDocuments({ status: 'New' });
    const contactedCount = await DemoRequest.countDocuments({ status: 'Contacted' });
    const progressCount = await DemoRequest.countDocuments({ status: 'In Progress' });
    const completedCount = await DemoRequest.countDocuments({ status: 'Completed' });

    return res.status(200).json({
      success: true,
      count: requests.length,
      metrics: {
        total: totalCount,
        new: newCount,
        contacted: contactedCount,
        inProgress: progressCount,
        completed: completedCount
      },
      data: requests
    });
  } catch (error) {
    console.error(`[Fetch Requests Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve requests database.'
    });
  }
};

// @desc    Get single request detail
// @route   GET /api/requests/:id
// @access  Private (Admin only)
const getRequestById = async (req, res) => {
  try {
    const request = await DemoRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request details not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error(`[Single Request Fetch Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch details.'
    });
  }
};

// @desc    Update Request Status
// @route   PATCH /api/requests/:id/status
// @access  Private (Admin only)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['New', 'Contacted', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status state selected.'
      });
    }

    const request = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully.',
      data: request
    });
  } catch (error) {
    console.error(`[Update Status Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to update request status.'
    });
  }
};

// @desc    Delete Request
// @route   DELETE /api/requests/:id
// @access  Private (Admin only)
const deleteRequest = async (req, res) => {
  try {
    const request = await DemoRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    // Delete associated uploaded files if they exist on the server
    const publicDir = path.join(__dirname, '..', 'public');
    
    if (request.logoUrl) {
      const logoPath = path.join(publicDir, request.logoUrl);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    if (request.photosUrls && request.photosUrls.length > 0) {
      request.photosUrls.forEach(photoUrl => {
        const photoPath = path.join(publicDir, photoUrl);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      });
    }

    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Request and associated uploaded files deleted successfully.'
    });
  } catch (error) {
    console.error(`[Delete Request Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete request.'
    });
  }
};

// @desc    Export requests to CSV
// @route   GET /api/requests/export
// @access  Private (Admin only)
const exportRequestsCSV = async (req, res) => {
  try {
    const requests = await DemoRequest.find({}).sort({ createdAt: -1 });

    // Define CSV header columns
    const headers = [
      'Request ID', 'Date', 'Full Name', 'Business Name', 'Business Type',
      'Mobile', 'WhatsApp', 'Email', 'Service Required', 'Budget', 
      'Deadline', 'City & State', 'Address', 'Status', 'Reference Link'
    ];

    // Map requests to rows
    const rows = requests.map(req => {
      return [
        req.requestId,
        new Date(req.createdAt).toLocaleDateString(),
        `"${req.fullName.replace(/"/g, '""')}"`,
        `"${req.businessName.replace(/"/g, '""')}"`,
        req.businessType,
        `"${req.mobile}"`,
        `"${req.whatsapp || ''}"`,
        req.email,
        req.requiredService,
        req.budgetRange || 'Flexible',
        req.deadline ? new Date(req.deadline).toLocaleDateString() : 'Flexible',
        `"${(req.cityState || '').replace(/"/g, '""')}"`,
        `"${(req.businessAddress || '').replace(/"/g, '""')}"`,
        req.status,
        `"${req.referenceLink || ''}"`
      ];
    });

    // Construct CSV file string
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Send file attachment
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=demo_requests_export_${Date.now()}.csv`);
    
    return res.status(200).send(csvContent);

  } catch (error) {
    console.error(`[CSV Export Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate CSV export file.'
    });
  }
};

module.exports = {
  submitRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
  exportRequestsCSV
};
