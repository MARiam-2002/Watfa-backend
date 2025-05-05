
export const resetPassword = (code) => `<!DOCTYPE html>
<html>

    <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <style type="text/css">

            @media screen {
                @font-face {
                    font-family: 'Lato';
                    font-style: normal;
                    font-weight: 400;
                    src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
                }

                @font-face {
                    font-family: 'Lato';
                    font-style: normal;
                    font-weight: 700;
                    src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
                }

                @font-face {
                    font-family: 'Lato';
                    font-style: italic;
                    font-weight: 400;
                    src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
                }

                @font-face {
                    font-family: 'Lato';
                    font-style: italic;
                    font-weight: 700;
                    src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
                }
            }

            /* CLIENT-SPECIFIC STYLES */
            body,
            table,
            td,
            a {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }

            table,
            td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }

            img {
                -ms-interpolation-mode: bicubic;
            }

            /* RESET STYLES */
            img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
            }

            table {
                border-collapse: collapse !important;
            }

            body {
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }

            /* iOS BLUE LINKS */
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }

            /* MOBILE STYLES */
            @media screen and (max-width:600px) {
                h1 {
                    font-size: 32px !important;
                    line-height: 32px !important;
                }

                .res_img{
                    width: 200px !important;
                }
            }

            /* ANDROID CENTER FIX */
            div[style*="margin: 16px 0;"] {
                margin: 0 !important;
            }

        </style>
    </head>

    <body style="background-color: #FFFFFF; margin: 0 !important; padding: 0 !important;">

        <div
            style="display: none; font-size: 1px; color: #FFFFFF; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
            We're thrilled to have you here! Get ready to dive into your new account. 
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%">

            <tr>
                
                <td bgcolor="#C1D1E6" style="height: 150px;" align="center">

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

                        <tr>

                            <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>

                        </tr>

                    </table>

                </td>

            </tr>

            <tr>

                <td bgcolor="#C1D1E6" align="center" style="padding: 0px 10px 0px 10px;">

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

                        <tr>

                            <td bgcolor="#FFFFFF" align="center" valign="top"
                                style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #000000; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;"
                            >

                                <!-- <h1 style="font-size: 48px; font-weight: 400; margin: 2; color: #FFFFFF">Welcome!</h1>  -->

                                <img
                                    class="res_img"
                                    src="https://res.cloudinary.com/dgzucjqgi/image/upload/v1746479874/ArtHub-06_2_kjeduf.png"
                                    style="display: block; border: 0px;" 
                                />

                            </td>

                        </tr>

                    </table>

                </td>

            </tr>

            <tr>

                <td bgcolor="#FFFFFF" align="center" style="padding: 0px 10px 0px 10px;">

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

                        <!-- <tr>
                            <td bgcolor="#FFFFFF" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0; text-align:center">YOUR OPT : *****</p>
                            </td>
                        </tr>-->

                        <tr>

                            <td bgcolor="#FFFFFF" align="left">

                                <table width="100%" border="0" cellspacing="0" cellpadding="0">

                                    <tr>

                                        <td bgcolor="#FFFFFF" align="center" style="padding: 20px 30px 30px 30px;">

                                            <table border="0" cellspacing="0" cellpadding="0">

                                                <tr>

                                                    <td align="center" style="border-radius: 3px;" bgcolor="#E0ECFC">

                                                        <div 
                                                            href="#"
                                                            style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #FFFFFF ; text-decoration: none; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #E0ECFC; display: inline-block;"
                                                        >
                                                            ${code}
                                                        </div>

                                                    </td>

                                                </tr>

                                            </table>

                                        </td>

                                    </tr>

                                </table>

                            </td>

                        </tr> <!-- COPY -->

                        <tr>
                            
                            <td 
                                bgcolor="#FFFFFF" align="left"
                                style="padding: 0px 30px 20px 30px; color: #515151; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;"
                            >
                                <p style="margin: 0; text-align:center;">
                                    If you have any questions, just reply to this email&mdash;we're always
                                    happy to help out.
                                </p>

                            </td>

                        </tr>


                    </table>

                </td>

            </tr>

            <tr>

                <td bgcolor="#FFFFFF" align="center" style="padding: 30px 10px 0px 10px;">

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

                        <tr>

                            <td 
                                bgcolor="#C1D1E6" align="center"
                                style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #FFFFFF; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;"
                            >
                                <h2 style="font-size: 20px; font-weight: 400; color: #FFFFFF; margin: 0;">Need more help?</h2>
                                
                                <p style="margin: 0;">

                                    <a 
                                        href="mailto:portal_app_team@svkm.ac.in" target="_blank"
                                        style="color: #FFFFFF;"
                                    >
                                        We&rsquo;re here to help you out
                                    </a>

                                </p>

                            </td>

                        </tr>

                    </table>

                </td>

            </tr>

            <tr>

                <td bgcolor="#FFFFFF" align="center" style="padding: 0px 10px 0px 10px;">

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

                        <tr>

                            <td 
                                bgcolor="#FFFFFF" align="left"
                                style="padding: 0px 30px 30px 30px; color: #515151; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"
                            >
                                <br>

                                <p style="margin: 0; text-align: center;">
                                    If these emails get annoying, please feel free to 
                                    <a href="#" target="_blank" style="color: #000000; font-weight: 700;">unsubscribe</a>.
                                </p>

                            </td>

                        </tr>

                    </table>

                </td>

            </tr>

        </table>

    </body>

</html>`;
