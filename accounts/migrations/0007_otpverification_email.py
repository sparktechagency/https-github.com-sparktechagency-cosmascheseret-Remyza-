from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0006_user_timezone"),
    ]

    operations = [
        migrations.AlterField(
            model_name="otpverification",
            name="phone_number",
            field=models.CharField(blank=True, default="", max_length=30),
        ),
        migrations.AddField(
            model_name="otpverification",
            name="email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.AddIndex(
            model_name="otpverification",
            index=models.Index(fields=["email"], name="otp_verific_email_3d752c_idx"),
        ),
    ]
