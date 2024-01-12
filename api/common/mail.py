from email.mime.base import MIMEBase
from typing import Any, Optional, Dict, Tuple, Union, Sequence

from django.conf import settings
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.core.mail.message import BadHeaderError
from django.template.loader import render_to_string
from django.template.exceptions import TemplateDoesNotExist


AttachmentTuple = Tuple[str, str, str] # (filename, content, mimetype)

def render_mail(
        template_name: str,
        to: Union[str, Sequence[str]],
        *, 
        context: Optional[Dict[str, Any]] = None, 
        headers: Optional[Dict[str, str]] = None,
        subject: Optional[str] = None,
        cc: Optional[Union[str, Sequence[str]]] = None,
        bcc: Optional[Union[str, Sequence[str]]] = None,
        reply_to: Optional[Union[str, Sequence[str]]] = None,
        attachments: Optional[Sequence[Union[AttachmentTuple, MIMEBase]]] = None,
    ):
    """
    Renders an email message using a template name and returns an `EmailMessage` object.
    The template name is used to find the following template files:
        - {template_name}_message.html
        - {template_name}_message.txt 
        - {template_name}_subject.txt 

    NOTE: At least a type of _message template must exist!

    Parameters:
    - template_name: The base name of the template to use.
    - to: The recipient(s) of the email. Can be a string or a list of strings.
    - context: The context to use when rendering the template.
    - headers: A dictionary of extra headers to use for the email.
    - subject: The subject of the email. If not given, the {template_name}_subject.txt template will be used.
    - cc: The CC recipient(s) of the email. Can be a string or a list of strings.
    - bcc: The BCC recipient(s) of the email. Can be a string or a list of strings.
    - reply_to: The Reply-To address(es) of the email. Can be a string or a list of strings.
    - attachments: A list of attachments to add to the email. Can be a list of tuples of `(filename, content, mimetype)` or `MIMEBase` objects.
    """
    to = [to] if isinstance(to, str) else to
    cc = [cc] if isinstance(cc, str) else cc
    bcc = [bcc] if isinstance(bcc, str) else bcc
    reply_to = [reply_to] if isinstance(reply_to, str) else reply_to

    if not subject:
        try:
            subject = render_to_string("{0}_subject.txt".format(template_name), context)
        except TemplateDoesNotExist:
            raise TemplateDoesNotExist(
                "No subject given and {0}_subject.txt template file found. At least one must be given.".format(template_name)
            )
    # remove superfluous line breaks
    subject = " ".join(subject.splitlines()).strip()
    
    from_email = settings.EMAIL_HOST_USER
    
    bodies = {}
    for ext in ["html", "txt"]:
        try:
            template = "{0}_message.{1}".format(template_name, ext)
            bodies[ext] = render_to_string(template, context).strip()
        except TemplateDoesNotExist:
            if ext == "txt" and not bodies:
                raise TemplateDoesNotExist(
                    "No template found for {0}. At least a .txt template must exist.".format(template_name)
                )
            
    if "txt" in bodies:
        msg = EmailMultiAlternatives(
            subject, bodies["txt"], from_email, to,
            headers=headers, cc=cc, bcc=bcc, reply_to=reply_to, attachments=attachments
        )

        if "html" in bodies:
            msg.attach_alternative(bodies["html"], "text/html")
    else:
        msg = EmailMessage(
            subject, bodies["html"], from_email, to,
            headers=headers, cc=cc, bcc=bcc, reply_to=reply_to, attachments=attachments
        )
        msg.content_subtype = "html"
    return msg
