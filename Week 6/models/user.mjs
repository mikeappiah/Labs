import crypto from 'node:crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please enter your first name!'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please enter your last name!'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter a password!'],
      select: false,
      validate: [
        validator.isStrongPassword,
        'Please enter a stronger password!',
      ],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    dateOfBirth: {
      type: Date,
      required: [true, 'Please enter a date of birth!'],
      validate: [validator.isDate, 'Please enter a valid date of birth!'],
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: [true, 'Please enter a phone number!'],
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
  },
  {
    discriminatorKey: 'role',
    timestamps: true,
  },
);

/* document middleware to hash password before saving into db */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* instance method to create a random password reset token */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 30 * 60 * 10000; // expires in 30 minutes

  return resetToken;
};

/* instance method to check if user changed password after the jwt token was issued */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ phoneNumber: 1 });

const User = mongoose.model('User', userSchema);

export default User;
